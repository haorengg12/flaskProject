import os
import importlib.util

from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'  # 指定上传目录
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 限制文件大小（如16MB）[1,6](@ref)
CORS(app,
     origins=["http://localhost:3000"],  # 允许的源
     methods=["GET", "POST"],  # 允许的HTTP方法
     allow_headers=["Content-Type", "Authorization"],  # 允许的请求头
     supports_credentials=True)  # 允许携带Cookie（需指定具体域名）


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


@app.route('/train')
def train_def():
    name = request.args.get('algorithm_name')
    json_data = request.get_json()
    if name is not None:
        result_str = run_train_functions(name, json_data)
        return result_str
    else:
        return f'执行成功'


def run_train_functions(algorithm_name, param):
    """
    动态调用接口函数
    :param algorithm_name:
    :param param:
    :return:
    """
    result_str = None
    # 遍历根目录下的train文件夹
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'train')
    for filename in os.listdir(model_path):
        if filename.endswith(".py") and filename[:-3].lower() == ("train_" + algorithm_name):
            filepath = os.path.join(model_path, filename)
            module_name = filename[:-3]  # 移除.py后缀作为模块名

            # 动态加载模块
            spec = importlib.util.spec_from_file_location(module_name, filepath)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            # 检查并调用train函数
            if hasattr(module, 'train'):
                result_str = module.train(param)
            else:
                result_str = f"找到文件但没有train函数"
    if result_str is None:
        result_str = "没有找到文件"
    return result_str


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': '未上传文件'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '文件名为空'}), 400

    # 安全处理文件名并保存
    filename = secure_filename(file.filename)
    file.save(os.path.join("./train", filename))
    return jsonify({'message': '上传成功', 'filename': filename}), 200


if __name__ == '__main__':
    app.run()
