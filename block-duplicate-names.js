// Versão corrigida do block-duplicate-names.js
function initializeJitsiNameCheck() {
    // Verifica se a API está disponível de forma mais robusta
    if (!window.JitsiMeetJS || typeof window.JitsiMeetJS.init !== 'function') {
        console.warn('JitsiMeetJS não disponível. Tentando novamente...');
        setTimeout(initializeJitsiNameCheck, 1000);
        return;
    }

    // Configuração inicial modificada
    const initOptions = {
        disableAudioLevels: true,
        enableWindowOnErrorHandler: true
    };

    try {
        // Inicialização modificada para versões mais recentes
        window.JitsiMeetJS.init(initOptions);
        
        // Cria a conexão - método mais atualizado
        const connection = new window.JitsiMeetJS.JitsiConnection(
            null,
            null,
            {
                serviceUrl: 'wss://ricardo.jitsi.participameet.com/xmpp-websocket',
                // Opções adicionais recomendadas
                enableLipSync: false,
                clientNode: 'http://jitsi.org/jitsimeet'
            }
        );

        // Eventos de conexão
        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
            () => {
                console.log('Conexão estabelecida. Verificando nomes...');
                
                const roomName = window.location.pathname.split('/').pop();
                const roomOptions = {
                    openBridgeChannel: true,
                    // Configurações adicionais
                    startAudioMuted: false,
                    startVideoMuted: false
                };

                const room = connection.initJitsiConference(roomName, roomOptions);

                // Evento de participante modificado
                room.on(
                    window.JitsiMeetJS.events.conference.CONFERENCE_JOINED,
                    () => {
                        console.log('Conferência iniciada. Monitorando participantes...');
                    }
                );

                room.on(
                    window.JitsiMeetJS.events.conference.PARTICIPANT_JOINED,
                    (participant) => {
                        const participants = room.getParticipants();
                        const currentName = participant.getDisplayName();
                        
                        console.log(`Novo participante: ${currentName}`);

                        const nameExists = participants.some(p => 
                            p.getDisplayName() === currentName && 
                            p.getId() !== participant.getId()
                        );

                        if (nameExists) {
                            console.warn(`Nome duplicado detectado: ${currentName}`);
                            try {
                                room.kickParticipant(participant.getId());
                                window.alert(`O nome "${currentName}" já está em uso!`);
                            } catch (error) {
                                console.error('Erro ao expulsar participante:', error);
                            }
                        }
                    }
                );

                room.join();
            }
        );

        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_FAILED,
            (error) => {
                console.error('Falha na conexão:', error);
            }
        );

        connection.connect();
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
}

// Inicia o processo quando a API estiver pronta
function waitForJitsiAPI() {
    if (window.JitsiMeetJS && window.JitsiMeetJS.createLocalTracks) {
        initializeJitsiNameCheck();
    } else {
        setTimeout(waitForJitsiAPI, 500);
    }
}

// Inicia a verificação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', waitForJitsiAPI);