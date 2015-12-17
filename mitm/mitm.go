package main

import (
	"./Godeps/_workspace/src/golang.org/x/net/websocket"
	"bytes"
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type Listeners struct {
	// FIXME this sucks and should be replaced with something the prunes dead/closed connections
	connections []*websocket.Conn
	message     chan interface{}
}

func (l *Listeners) Broadcast() {
	for {
		jsonData := <-l.message

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

type SelectiveProxy struct {
	prefixes       map[string]http.Handler
	defaultHandler http.Handler
}

func (s SelectiveProxy) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	requestUrlStr := req.URL.String()

	for prefix, handler := range s.prefixes {
		// FIXME this is crappy and should be replaced with a trie or something just better
		if strings.Index(requestUrlStr, prefix) == 0 {
			// call the first handler whose prefix matches the starf of the requestUrlStr
			handler.ServeHTTP(w, req)
			return
		}
	}

	s.defaultHandler.ServeHTTP(w, req)
}

func main() {
	urlStr := flag.String("url", "http://localhost:8080", "MMS Backend URL")
	proxyPort := flag.Int("port", 9090, "Reverse Proxy Port")
	staticPath := flag.String("staticPath", "../webapp/dist", "Cyclops Frontend")
	flag.Parse()

	mmsUrl, err := url.Parse(*urlStr)

	if err != nil {
		panic("Could not parse url: " + err.Error())
	}

	message := make(chan interface{})
	listeners := Listeners{connections: make([]*websocket.Conn, 0), message: message}
	go listeners.Broadcast()
	proxy := httputil.NewSingleHostReverseProxy(mmsUrl)

	// use some TLS client configuration if urlStr starts with https
	useSSL := strings.Index(*urlStr, "https") == 0

	if useSSL {
		tlsConfig := &tls.Config{
			InsecureSkipVerify: true,
		}
		tlsConfig.BuildNameToCertificate()
		var TLSTransport http.RoundTripper = &http.Transport{
			TLSClientConfig:    tlsConfig,
			DisableCompression: true,
			Dial: (&net.Dialer{
				Timeout:   30 * time.Second,
				KeepAlive: 30 * time.Second,
			}).Dial,
			TLSHandshakeTimeout: 10 * time.Second,
		}
		proxy.Transport = TLSTransport
	}

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
			}

			request.Body = ioutil.NopCloser(bytes.NewReader(buf))
		}

		oldDirector(request)

		// FIXME: why is this necessary???!?
		request.Host = mmsUrl.Host

		if useSSL && strings.Index(mmsUrl.Host, ":") < 0 {
			request.Host += ":443"
		}
	}

	prefixes := make(map[string]http.Handler)
	prefixes["/ws"] = websocket.Handler(listeners.Add)
	prefixes["/agents/api/automation/"] = proxy
	selectiveProxy := SelectiveProxy{prefixes: prefixes, defaultHandler: http.FileServer(http.Dir(*staticPath))}
	http.ListenAndServe(":"+strconv.Itoa(*proxyPort), selectiveProxy)
}
