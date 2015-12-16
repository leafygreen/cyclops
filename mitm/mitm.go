package main

import (
	"./Godeps/_workspace/src/golang.org/x/net/websocket"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
    "io"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

type Listeners struct {
    connections []*websocket.Conn
    message chan interface{}
}

func (l *Listeners) Broadcast() {
    for {
        jsonData := <- l.message

        if jsonData == nil {
            continue
        }

        buf, err := json.Marshal(jsonData)

        if err != nil {
            fmt.Println(err.Error())
            continue
        }

        for _, ws := range l.connections {
            if ws != nil {
                _, err2 := ws.Write(buf)

                if err2 != nil {
                    fmt.Println(err2.Error())
                }
            }
        }
    }
}

func (l *Listeners) Add(ws *websocket.Conn) {
    l.connections = append(l.connections, ws)
    io.Copy(ws, ws)
}

func main() {
	urlStr := flag.String("url", "http://localhost:8080", "MMS Backend URL")
	flag.Parse()

	mmsUrl, err := url.Parse(*urlStr)

	if err != nil {
        panic("Could not parse url: " + err.Error())
    }

    message := make(chan interface{})
    listeners := Listeners{connections: make([]*websocket.Conn, 0), message: message}

    go listeners.Broadcast()

    go func() {
        http.Handle("/", websocket.Handler(listeners.Add))
        http.ListenAndServe(":12345", nil)
    }()

	proxy := httputil.NewSingleHostReverseProxy(mmsUrl)

	// override director to intercept request body
	oldDirector := proxy.Director
	proxy.Director = func(request *http.Request) {
		fmt.Printf("%s %s %s\n", request.Method, request.URL, request.Header.Get("Content-Type"))

		if strings.Index(request.Header.Get("Content-Type"), "application/json") == 0 {
			buf, _ := ioutil.ReadAll(request.Body)
			var jsonData interface{}
			err := json.Unmarshal(buf, &jsonData)

			if err == nil {
                requestUrlStr := request.URL.String()
                queryParams, _ := url.ParseQuery(request.URL.RawQuery)

                // copy jsonData to websocket listeners
                wrapper := make(map[string]interface{})
                wrapper["remoteAddr"] = request.RemoteAddr
                wrapper["ah"] = queryParams.Get("ah")
                wrapper["type"] = nil

                if strings.Index(requestUrlStr, "/agents/api/automation/metrics") == 0 {
                    wrapper["type"] = "metrics"
                } else if strings.Index(requestUrlStr, "/agents/api/automation/status") == 0 {
                    wrapper["type"] = "status"
                } else if strings.Index(requestUrlStr, "/agents/api/automation/log") == 0 {
                    wrapper["type"] = "log"
                }

                wrapper["content"] = jsonData
                message <- wrapper
				//fmt.Println(jsonData)
			}

			request.Body = ioutil.NopCloser(bytes.NewReader(buf))
		}

		oldDirector(request)
	}

	http.ListenAndServe(":9090", proxy)
}
