service.py 基础服务类, 所有服务的基类
service_manager.py 服务管理类, 检测所有服务的状态，每个服务都需要定时跟service_mgr通信
build.py 服务构建脚本, 生成服务配置文件，可以配合shell脚本一起使用
redis.py 对redis操作的封装
