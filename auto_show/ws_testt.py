from threading import current_thread

from flask import Flask, copy_current_request_context
from flask_socketio import SocketIO, emit
import numpy as np
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'rl_secret'
# socketio = SocketIO(app, cors_allowed_origins="*")
socketio = SocketIO(app,
                    transports=['websocket'],
                    cors_allowed_origins="*",  # 解决跨域[7](@ref)
                    path='/ws-rl',  # 显式定义路径[4](@ref)
                    use_reloader=False,
                    log_output=False,
                    ping_timeout=10,  # 等待pong响应的超时时间（秒）
                    ping_interval=5  # 发送ping的心跳间隔（秒）
                    )


class RLSimulator:
    def __init__(self):
        self.state = np.zeros(3)
        self.step = 0

    def get_next_state(self):
        self.state += np.random.uniform(-1, 1, 3)
        reward = np.sum(np.abs(self.state))
        self.step += 1
        return {
            'step': self.step,
            'state': self.state.tolist(),
            'reward': float(reward),
            'action': np.random.choice(['left', 'right', 'up', 'down'])
        }


@socketio.on('connect')
def handle_connect():
    print('Client connected')
    simulator = RLSimulator()

    @copy_current_request_context  # 关键修复：复制请求上下文
    def send_updates():
        while True:
            data = simulator.get_next_state()
            # 使用socketio.emit代替emit，并指定namespace
            socketio.emit('rl_update', data)
            time.sleep(0.1)
            print('sending updates')
    # def send_updates():
        # try:
        #     while getattr(current_thread(), "running", True):
        #         data = simulator.get_next_state()
        #         socketio.emit('rl_update', data, namespace='/ws-rl')
        #         time.sleep(0.01)
        # except (AssertionError, BrokenPipeError, ConnectionResetError):
        #     print("检测到连接已中断")

    # 使用socketio提供的后台任务方法
    socketio.start_background_task(send_updates)


@socketio.on('disconnect', namespace='/ws-rl')
def handle_disconnect():
    print('客户端断开连接，停止发送数据')
    # 设置线程停止标志（需配合线程逻辑）
    if hasattr(app, 'simulator_thread'):
        app.simulator_thread.running = False


if __name__ == '__main__':
    socketio.run(app, port=5000, debug=True,async_mode='eventlet')
