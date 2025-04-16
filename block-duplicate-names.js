// Versão final testada do block-duplicate-names.js
(function () {
    // Configurações globais
    const JITSI_CONFIG = {
        serviceUrl: 'wss://ricardo.jitsi.participameet.com/xmpp-websocket',
        domain: 'ricardo.jitsi.participameet.com',
        enableLipSync: false,
        clientNode: 'http://jitsi.org/jitsimeet'
    };

    // Verifica se a API está pronta
    function isJitsiAPIReady() {
        return window.JitsiMeetJS &&
            window.JitsiMeetJS.init &&
            window.JitsiMeetJS.JitsiConnection;
    }

    // Inicialização principal
    function initializeNameCheckSystem() {
        if (!isJitsiAPIReady()) {
            console.warn('block-duplicate-names-> Jitsi API não está pronta. Tentando novamente...');
            setTimeout(initializeNameCheckSystem, 1000);
            return;
        }

        try {
            // Configuração de inicialização
            window.JitsiMeetJS.init({
                disableAudioLevels: true,
                enableWindowOnErrorHandler: true
            });

            // Cria a conexão com configuração segura
            const connection = new window.JitsiMeetJS.JitsiConnection(
                null, // App ID
                null, // Token
                {
                    hosts: {
                        domain: JITSI_CONFIG.domain,
                        muc: `conference.${JITSI_CONFIG.domain}`
                    },
                    serviceUrl: JITSI_CONFIG.serviceUrl,
                    clientNode: JITSI_CONFIG.clientNode
                }
            );

            // Configura os listeners de conexão
            setupConnectionListeners(connection);

            // Inicia a conexão
            connection.connect();

        } catch (error) {
            console.error('block-duplicate-names-> Erro crítico na inicialização:', error);
            showErrorToUser('Erro ao conectar à sala. Por favor, recarregue a página.');
        }
    }

    // Configura os listeners da conexão
    function setupConnectionListeners(connection) {
        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
            () => handleConnectionSuccess(connection)
        );

        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_FAILED,
            error => {
                console.error('block-duplicate-names-> Falha na conexão:', error);
                // showErrorToUser('Falha ao conectar. Verifique sua internet.');
            }
        );
    }

    // Manipula conexão bem-sucedida
    function handleConnectionSuccess(connection) {
        console.log('block-duplicate-names-> Conexão XMPP estabelecida com sucesso');

        const roomName = getRoomNameFromURL();
        const roomOptions = {
            openBridgeChannel: 'datachannel',
            startAudioMuted: false,
            startVideoMuted: false
        };

        const room = connection.initJitsiConference(roomName, roomOptions);
        console.log('block-duplicate-names-> sala investigada', room);

        // Configura os listeners da sala
        setupRoomListeners(room);

        room.join();
    }

    // Configura os listeners da sala
    function setupRoomListeners(room) {
        room.on(
            window.JitsiMeetJS.events.conference.CONFERENCE_JOINED,
            () => console.log('block-duplicate-names-> Conferência iniciada com sucesso')
        );

        room.on(
            window.JitsiMeetJS.events.conference.PARTICIPANT_JOINED,
            participant => checkDuplicateName(room, participant)
        );
    }

    // Verifica nomes duplicados
    function checkDuplicateName(room, newParticipant) {
        const participants = room.getParticipants();
        console.log('block-duplicate-names-> Participantes da sala:', participants)
        const currentName = newParticipant.getDisplayName();

        // Verificação case-insensitive
        const isDuplicate = participants.some(p =>
            String(p.getDisplayName()).toLowerCase() === String(currentName).toLowerCase() &&
            p.getId() !== newParticipant.getId()
        );

        if (isDuplicate) {
            console.warn(`block-duplicate-names->Nome duplicado detectado: ${currentName}`);
            try {
                room.kickParticipant(newParticipant.getId());
                showAlert(`O nome "${currentName}" já está em uso. Escolha outro nome.`);
            } catch (error) {
                console.error('block-duplicate-names->Erro ao expulsar participante:', error);
            }
        }
    }

    // Helper: Obtém nome da sala da URL
    function getRoomNameFromURL() {
        return window.location.pathname.split('/').pop() || 'default-room';
    }

    // Helper: Mostra alerta para o usuário
    function showAlert(message) {
        try {
            window.alert(message);
        } catch (e) {
            console.warn('block-duplicate-names->Não foi possível mostrar alerta:', e);
        }
    }

    // Helper: Mostra erro para o usuário
    function showErrorToUser(message) {
        const errorElement = document.createElement('div');
        errorElement.style = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ff4444; color: white; padding: 15px; z-index: 9999; border-radius: 5px;';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);

        setTimeout(() => {
            document.body.removeChild(errorElement);
        }, 5000);
    }

    // Inicia o sistema quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function () {
        // Espera até que a API Jitsi esteja pronta
        function waitForJitsi() {
            if (isJitsiAPIReady()) {
                initializeNameCheckSystem();
            } else {
                setTimeout(waitForJitsi, 500);
            }
        }

        waitForJitsi();
    });
})();