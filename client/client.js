var tcPing = require('tcp-ping');
var nodeSsh = require('node-ssh');
const ssh = new nodeSsh();

const attemptConnect = async () => {
    var live = await tcPing.probeAsync('192.168.1.42', 22);
    if (live) {
        const password = '';
        console.log('port open', live)
        ssh.connect({
            host: '<hostname>',
            port: 22,
            username: 'pi',
            password: password
        }).then(() => {
            ssh.execCommand('ls').then((status) => {
                console.log(status);
                ssh.dispose();
            }).catch(() => {
                ssh.dispose();
            })
        }).catch((err) => console.error(err));
    }
}

attemptConnect();