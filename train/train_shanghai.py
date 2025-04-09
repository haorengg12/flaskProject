import time as t


def train(param):
    sleep_time = param['sleep_time']
    t.sleep(sleep_time)
    print(f'shanghai\'s train获取的参数', param)
    return f'shanghai\'s train函数执行成功 运行了{sleep_time}秒'
