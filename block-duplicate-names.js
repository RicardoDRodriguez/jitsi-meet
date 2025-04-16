/**
 *  block-duplicate-names.js
 *  Verifica nomes duplicados
 */

(function () {
    // Configurações globais melhoradas
    const JITSI_CONFIG = {
        serviceUrl: 'wss://ricardo.jitsi.participameet.com/xmpp-websocket',
        boshUrl: 'https://ricardo.jitsi.participameet.com/http-bind',
        domain: 'ricardo.jitsi.participameet.com',
        clientNode: 'participant-name-checker',
        maxReconnectionAttempts: 3,
        reconnectionDelay: 2000
    };

    // Estado da aplicação
    const APP_STATE = {
        connection: null,
        room: null,
        reconnectionAttempts: 0
    };

    // ======================
    // FUNÇÕES PRINCIPAIS
    // ======================

    /**
     * Inicializa o sistema quando a API Jitsi estiver pronta
     */
    function initializeSystem() {
        if (isJitsiAPIReady()) {
            console.log('block-duplicate-names-> API Jitsi carregada com sucesso');
            initializeJitsiConnection();
        } else {
            console.warn('block-duplicate-names-> API Jitsi não disponível, tentando novamente...');
            setTimeout(initializeSystem, 500);
        }
    }

    /**
     * Inicializa a conexão Jitsi com tratamento robusto de erros
     */
    function initializeJitsiConnection() {
        try {
            // Configuração de inicialização
            window.JitsiMeetJS.init({
                disableAudioLevels: true,
                enableWindowOnErrorHandler: true,
                disableSimulcast: false
            });

            // Configuração de conexão completa
            const connectionOptions = {
                hosts: {
                    domain: JITSI_CONFIG.domain,
                    muc: `conference.${JITSI_CONFIG.domain}`,
                    focus: `focus.${JITSI_CONFIG.domain}`
                },
                serviceUrl: JITSI_CONFIG.serviceUrl,
                bosh: JITSI_CONFIG.boshUrl,
                clientNode: JITSI_CONFIG.clientNode,
                enableStunTurn: true,
                useStunTurn: true,
                iceTransportPolicy: 'all'
            };

            console.log('block-duplicate-names-> Configuração de conexão:', connectionOptions);

            APP_STATE.connection = new window.JitsiMeetJS.JitsiConnection(
                null, // App ID
                null, // Token
                connectionOptions
            );

            setupConnectionListeners(APP_STATE.connection);
            APP_STATE.connection.connect();

        } catch (error) {
            console.error('block-duplicate-names-> Erro na inicialização da conexão:', error);
            handleConnectionError(error);
        }
    }

    // ======================
    // FUNÇÕES AUXILIARES
    // ======================

    /**
     * Verifica se a API Jitsi está pronta para uso
     */
    function isJitsiAPIReady() {
        return window.JitsiMeetJS &&
            typeof window.JitsiMeetJS.init === 'function' &&
            window.JitsiMeetJS.JitsiConnection &&
            window.JitsiMeetJS.events &&
            window.JitsiMeetJS.events.connection;
    }

    /**
     * Configura os listeners da conexão
     */
    function setupConnectionListeners(connection) {
        // Conexão estabelecida com sucesso
        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
            () => {
                console.log('block-duplicate-names-> Conexão XMPP estabelecida');
                APP_STATE.reconnectionAttempts = 0;
                initializeRoom();
            }
        );

        // Falha na conexão
        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_FAILED,
            (error) => {
                console.error('block-duplicate-names-> Falha na conexão:', error);
                handleConnectionError(error);
            }
        );

        // Conexão desconectada
        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
            () => {
                console.warn('block-duplicate-names-> Conexão desconectada');
                cleanUp();
            }
        );
    }

    /**
     * Inicializa a sala de conferência
     */
    function initializeRoom() {
        const roomName = getRoomNameFromURL();
        const roomOptions = {
            openBridgeChannel: true,
            startAudioMuted: false,
            startVideoMuted: false,
            enableNoAudioDetection: true,
            enableNoisyMicDetection: true
        };

        try {
            APP_STATE.room = APP_STATE.connection.initJitsiConference(roomName, roomOptions);
            setupRoomListeners(APP_STATE.room);
            APP_STATE.room.join();
        } catch (error) {
            console.error('block-duplicate-names-> Erro ao inicializar sala:', error);
            // showErrorToUser('Erro ao entrar na sala. Recarregue a página.');
        }
    }

    /**
     * Configura os listeners da sala
     */
    function setupRoomListeners(room) {
        // Conferência iniciada
        room.on(
            window.JitsiMeetJS.events.conference.CONFERENCE_JOINED,
            () => {
                console.log('block-duplicate-names-> Entrou na conferência com sucesso');
                // showSystemMessage('Conectado à sala');
            }
        );

        // Participante entrou
        room.on(
            window.JitsiMeetJS.events.conference.PARTICIPANT_JOINED,
            (participant) => {
                console.log(`block-duplicate-names-> Novo participante: ${participant.getDisplayName()}`);
                checkDuplicateName(room, participant);
            }
        );

        // Erros na sala
        room.on(
            window.JitsiMeetJS.events.conference.CONFERENCE_ERROR,
            (error) => {
                console.error('block-duplicate-names-> Erro na conferência:', error);
                showErrorToUser('Erro na sala. Reconectando...');
                reconnect();
            }
        );
    }

    /**
     * Verifica nomes duplicados (case-insensitive)
     */
    function checkDuplicateName(room, newParticipant) {
        const participants = room.getParticipants();
        const currentName = newParticipant.getDisplayName();

        const isDuplicate = participants.some(p =>
            String(p.getDisplayName()).toLowerCase() === String(currentName).toLowerCase() &&
            p.getId() !== newParticipant.getId()
        );

        if (isDuplicate) {
            console.warn(`block-duplicate-names-> Nome duplicado detectado: ${currentName}`);
            try {
                room.kickParticipant(newParticipant.getId());
                showAlert(`O nome "${currentName}" já está em uso. Por favor, escolha outro nome.`);
            } catch (error) {
                console.error('block-duplicate-names-> Erro ao expulsar participante:', error);
                // Fallback: Adiciona um sufixo numérico ao nome
                newParticipant.setDisplayName(`${currentName}_${Math.floor(Math.random() * 100)}`);
                showAlert(`Seu nome foi alterado para "${newParticipant.getDisplayName()}" para evitar duplicação.`);
            }
        }
    }

    /**
     * Trata erros de conexão
     */
    function handleConnectionError(error) {
        if (APP_STATE.reconnectionAttempts < JITSI_CONFIG.maxReconnectionAttempts) {
            APP_STATE.reconnectionAttempts++;
            console.warn(`block-duplicate-names-> Tentativa de reconexão ${APP_STATE.reconnectionAttempts}`);
            setTimeout(reconnect, JITSI_CONFIG.reconnectionDelay);
        } else {
            console.error('block-duplicate-names-> Máximo de tentativas de reconexão alcançado');
            showErrorToUser('Não foi possível conectar. Recarregue a página.');
        }
    }

    /**
     * Tenta reconectar
     */
    function reconnect() {
        cleanUp();
        initializeJitsiConnection();
    }

    /**
     * Limpeza de recursos
     */
    function cleanUp() {
        if (APP_STATE.room) {
            try {
                APP_STATE.room.leave();
            } catch (e) {
                console.warn('block-duplicate-names-> Erro ao sair da sala:', e);
            }
            APP_STATE.room = null;
        }

        if (APP_STATE.connection) {
            try {
                APP_STATE.connection.disconnect();
            } catch (e) {
                console.warn('block-duplicate-names-> Erro ao desconectar:', e);
            }
            APP_STATE.connection = null;
        }
    }

    // ======================
    // FUNÇÕES DE UTILIDADE
    // ======================

    /**
     * Obtém o nome da sala da URL
     */
    function getRoomNameFromURL() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'sala-sem-nome';
    }

    /**
     * Mostra alerta para o usuário
     */
    function showAlert(message) {
        try {
            window.alert(message);
        } catch (e) {
            console.warn('block-duplicate-names-> Não foi possível mostrar alerta:', e);
            showSystemMessage(message);
        }
    }

    /**
     * Mostra mensagem de erro na interface
     */
    function showErrorToUser(message) {
        showSystemMessage(message, 'error');
    }

    /**
     * Mostra mensagem do sistema na interface
     */
    function showSystemMessage(message, type = 'info') {
        try {
            const messageElement = document.createElement('div');
            messageElement.style = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
                color: white;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                max-width: 80%;
                text-align: center;
                animation: fadeIn 0.3s;
            `;
            messageElement.textContent = message;
            document.body.appendChild(messageElement);

            setTimeout(() => {
                messageElement.style.animation = 'fadeOut 0.3s';
                setTimeout(() => {
                    document.body.removeChild(messageElement);
                }, 300);
            }, 5000);

            // Adiciona estilos de animação se não existirem
            if (!document.getElementById('messageAnimations')) {
                const style = document.createElement('style');
                style.id = 'messageAnimations';
                style.textContent = `
                    @keyframes fadeIn {
                        from { opacity: 0; top: 0; }
                        to { opacity: 1; top: 20px; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
        } catch (e) {
            console.warn('block-duplicate-names-> Não foi possível mostrar mensagem:', e);
        }
    }

    // ======================
    // INICIALIZAÇÃO
    // ======================

    // Inicia quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function () {
        console.log('block-duplicate-names-> Iniciando sistema de verificação de nomes...');
        initializeSystem();
    });

})();