from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from db import get_connection
import traceback
import os
import socket

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "limpieza.log")

def log(texto: str):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {texto}\n")

def limpieza_automatica():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # === 1️⃣ MENSAJES ANTIGUOS (más de 30 días)
        fecha_limite = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        cursor.execute("DELETE FROM mensajes_contacto WHERE fecha < %s", (fecha_limite,))
        log("🧹 Mensajes antiguos eliminados")

        # === 2️⃣ SOLICITUDES (máx 50)
        cursor.execute("SELECT id FROM solicitudes ORDER BY fecha_solicitud ASC")
        solicitudes = cursor.fetchall()
        if len(solicitudes) > 50:
            ids = [row["id"] for row in solicitudes[:len(solicitudes) - 50]]
            cursor.executemany("DELETE FROM solicitudes WHERE id = %s", [(i,) for i in ids])
            log(f"🗑️ Eliminadas {len(ids)} solicitudes antiguas")

        # === 3️⃣ JORNADAS vencidas
        hoy = datetime.now().strftime("%Y-%m-%d")
        cursor.execute("""
            UPDATE jornadas SET estado = 'realizada'
            WHERE fecha < %s AND estado != 'realizada'
        """, (hoy,))
        log("🌿 Jornadas vencidas marcadas como realizadas")

        # === 4️⃣ NOTICIAS (máx 10)
        cursor.execute("SELECT id FROM noticias ORDER BY fecha_pub ASC")
        noticias = cursor.fetchall()
        if len(noticias) > 10:
            ids = [row["id"] for row in noticias[:len(noticias) - 10]]
            cursor.executemany("DELETE FROM noticias WHERE id = %s", [(i,) for i in ids])
            log(f"🗞️ Eliminadas {len(ids)} noticias antiguas")

        conn.commit()
        cursor.close()
        conn.close()
        log(f"✅ Limpieza ejecutada correctamente ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')})")

    except Exception:
        error_msg = traceback.format_exc()
        log(f"❌ Error en limpieza automática:\n{error_msg}")

def iniciar_cron():
    if os.environ.get("SCHEDULER_ACTIVE"):
        return  # ✅ Evita múltiples ejecuciones si Gunicorn usa varios workers

    os.environ["SCHEDULER_ACTIVE"] = "1"
    scheduler = BackgroundScheduler()
    scheduler.add_job(limpieza_automatica, 'interval', days=1)
    scheduler.start()
    log(f"🕒 Cron iniciado en {socket.gethostname()} (cada 24h)")
