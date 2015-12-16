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

	url, err := url.Parse(*urlStr)

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

	proxy := httputil.NewSingleHostReverseProxy(url)

	// override director to intercept request body
	oldDirector := proxy.Director
	proxy.Director = func(request *http.Request) {
		fmt.Printf("%s %s %s\n", request.Method, request.URL, request.Header.Get("Content-Type"))

		if strings.Index(request.Header.Get("Content-Type"), "application/json") == 0 {
			buf, _ := ioutil.ReadAll(request.Body)
			var jsonData interface{}
			err := json.Unmarshal(buf, &jsonData)

			if err == nil {
                // copy jsonData to websocket listeners
                message <- jsonData
				fmt.Println(jsonData)
			}

			request.Body = ioutil.NopCloser(bytes.NewReader(buf))
		}

		oldDirector(request)
	}

	http.ListenAndServe(":9090", proxy)
}
