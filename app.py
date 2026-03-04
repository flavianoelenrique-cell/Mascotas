from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)

def crear_db():
    conn = sqlite3.connect("mascotas.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mascotas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            estado TEXT,
            tipo TEXT,
            raza TEXT,
            zona TEXT,
            fecha TEXT,
            descripcion TEXT,
            telefono TEXT
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def inicio():
    conn = sqlite3.connect("mascotas.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mascotas")
    mascotas = cursor.fetchall()
    conn.close()
    return render_template("index.html", mascotas=mascotas)

@app.route("/publicar", methods=["POST"])
def publicar():
    estado = request.form["estado"]
    tipo = request.form["tipo"]
    raza = request.form["raza"]
    zona = request.form["zona"]
    fecha = request.form["fecha"]
    descripcion = request.form["descripcion"]
    telefono = request.form["telefono"]

    conn = sqlite3.connect("mascotas.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO mascotas (estado, tipo, raza, zona, fecha, descripcion, telefono)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (estado, tipo, raza, zona, fecha, descripcion, telefono))
    conn.commit()
    conn.close()

    return redirect("/")

if __name__ == "__main__":
    crear_db()
    app.run(debug=True)