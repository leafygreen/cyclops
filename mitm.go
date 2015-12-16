package main

import (
    "flag"
    "fmt"
    "bytes"
    "encoding/json"
    "io/ioutil"
    "net/http"
    "net/http/httputil"
    "net/url"
    "strings"
)

func main() {
    urlStr := flag.String("url", "http://localhost:8080", "MMS Backend URL")
    flag.Parse()
    
    url, err := url.Parse(*urlStr)

    if err == nil {
        proxy := httputil.NewSingleHostReverseProxy(url)

        // override director to output request body
        oldDirector := proxy.Director
        proxy.Director = func(request *http.Request) {
            fmt.Printf("%s %s %s\n", request.Method, request.URL, request.Header.Get("Content-Type"))

            if strings.Index(request.Header.Get("Content-Type"), "application/json") == 0 {
                buf, _ := ioutil.ReadAll(request.Body)
                var status interface{}
                err := json.Unmarshal(buf, &status)

                if err == nil {
                    fmt.Println(status)
                }

                //fmt.Println(string(buf))
                request.Body = ioutil.NopCloser(bytes.NewReader(buf))
            }

            oldDirector(request)
        }

        http.ListenAndServe(":9090", proxy)
    }
}
