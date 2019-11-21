package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/cobookman/unifi"
)

var (
	ubiquitiUser = os.Getenv("user")
	ubiquitiPass = os.Getenv("pass")
	wifipass     = os.Getenv("wifipass")
)

// FileSystem custom file system handler
type FileSystem struct {
	fs http.FileSystem
}

// Open opens file
func (fs FileSystem) Open(path string) (http.File, error) {
	f, err := fs.fs.Open(path)
	if err != nil {
		return nil, err
	}

	s, err := f.Stat()
	if s.IsDir() {
		index := strings.TrimSuffix(path, "/") + "/index.html"
		if _, err := fs.fs.Open(index); err != nil {
			return nil, err
		}
	}

	return f, nil
}

type AuthRequest struct {
	Ap       string `json:"ap"`
	Mac      string `json:"mac"`
	Password string `json:"password"`
}

// http: //192.168.1.35/guest/s/default/?ap=74:83:c2:d6:c9:db&id=38:f9:d3:61:d5:6c&t=1574315384&url=http://fooz.com%2f&ssid=corcor+guest
func authGuest(w http.ResponseWriter, r *http.Request) {
	var authReq AuthRequest

	err := json.NewDecoder(r.Body).Decode(&authReq)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if authReq.Password != wifipass {
		http.Error(w, "{\"status\": \"Invalid Password\"}", http.StatusUnauthorized)
		return
	}

	u := unifi.NewClient(ubiquitiUser, ubiquitiPass, "https://192.168.1.1:8443", "default", "5.12.22", true)
	if err := u.Login(); err != nil {
		http.Error(w, "Failed to connect to Admin Console", http.StatusInternalServerError)
		return
	}

	guest := unifi.UnifiGuest{
		Mac:     authReq.Mac,
		Expires: 1 * 60 * 24, // 24 hours
		Up:      1024 * 3,    // 3 Mibps
		Down:    1024 * 35,   // 35 Mibps
		Data:    1024 * 50,   // 50 GiB
	}

	if err := u.AuthGuest(guest); err != nil {
		http.Error(w, "Failed to register client for Guest Wifi", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "{\"status\": \"registered\"}")
}

func main() {
	port := flag.String("p", "80", "port to serve on")
	directory := flag.String("d", ".", "the directory of static file to host")
	flag.Parse()

	// handle api calls
	http.HandleFunc("/api/auth_guest", authGuest)

	// handle static asset calls
	fileServer := http.FileServer(FileSystem{http.Dir(*directory)})
	http.Handle("/", fileServer)
	http.Handle("/guest/s/default/", http.StripPrefix("/guest/s/default/", fileServer))

	log.Printf("Serving %s on HTTP port: %s\n", *directory, *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}
