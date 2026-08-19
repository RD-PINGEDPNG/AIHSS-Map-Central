from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import ssl
import webbrowser
import os

HOST = "127.0.0.1"
PORT = 8443

os.chdir(os.path.dirname(os.path.abspath(__file__)))

server = ThreadingHTTPServer(
    (HOST, PORT),
    SimpleHTTPRequestHandler
)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)

context.load_cert_chain(
    certfile="cert.pem",
    keyfile="key.pem"
)

server.socket = context.wrap_socket(
    server.socket,
    server_side=True
)

url = f"https://{HOST}:{PORT}"

print(f"Serving HTTPS at {url}")
print("Press Ctrl+C to stop.")

webbrowser.open(url)

try:
    server.serve_forever()

except KeyboardInterrupt:
    print("\nServer stopped.")
    server.server_close()