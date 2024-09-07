from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import send, join_room, SocketIO

app = Flask(__name__)
app.config["SECRET_KEY"] = "hjhjsdahhds"
socketio = SocketIO(app)

ROOM = "CommunityRoom"
rooms = {
    ROOM: {"members": 0, "messages": []}
}

@app.route("/", methods=["POST", "GET"])
def home():
    session.clear()
    if request.method == "POST":
        name = request.form.get("name")

        if not name:
            return render_template("home.html", error="Please enter a name.")

        session["name"] = name
        session["room"] = ROOM
        return redirect(url_for("room"))

    return render_template("home.html")

@app.route("/room")
def room():
    if session.get("name") is None:
        return redirect(url_for("home"))

    return render_template("chat.html", code=ROOM, messages=rooms[ROOM]["messages"])

@socketio.on("message")
def handle_message(data):
    room = session.get("room")
    if room not in rooms:
        return

    content = {
        "name": session.get("name"),
        "message": data["data"]
    }
    send(content, to=room)
    rooms[room]["messages"].append(content)
    print(f"{session.get('name')} said: {data['data']}")

@socketio.on("connect")
def handle_connect():
    room = session.get("room")
    name = session.get("name")

    if not room or not name:
        return

    join_room(room)
    rooms[room]["members"] += 1
    send({"name": name, "message": "has entered the chat"}, to=room)
    print(f"{name} joined room {room}")

@socketio.on("disconnect")
def handle_disconnect():
    room = session.get("room")
    name = session.get("name")

    if room in rooms:
        rooms[room]["members"] -= 1
        if rooms[room]["members"] <= 0:
            del rooms[room]

    send({"name": name, "message": "has left the chat"}, to=room)
    print(f"{name} has left the room {room}")

if __name__ == "__main__":
    socketio.run(app, debug=True)
