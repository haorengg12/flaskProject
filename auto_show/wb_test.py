# app.py
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import numpy as np
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'rl_secret'
socketio = SocketIO(app, cors_allowed_origins="*")


# 模拟强化学习过程
class RLSimulator:
    def __init__(self):
        self.state = np.zeros(3)
        self.step = 0

    def get_next_state(self):
        self.state += np.random.uniform(-1, 1, 3)  # 随机动作
        reward = np.sum(np.abs(self.state))
        self.step += 1
        return {
            'step': self.step,
            'state': self.state.tolist(),
            'reward': float(reward),
            'action': np.random.choice(['left', 'right', 'up', 'down'])
        }


@socketio.on('connect', namespace='/ws-rl')
def handle_connect():
    print('Client connected')
    simulator = RLSimulator()

    def send_updates():
        while True:
            data = simulator.get_next_state()
            emit('rl_update', data)
            time.sleep(0.01)  # 控制发送频率
            print(1)

    socketio.start_background_task(send_updates)


if __name__ == '__main__':
    socketio.run(app=app, port=5000, debug=True, use_reloader=False, log_output=False)
