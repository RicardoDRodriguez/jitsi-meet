
import { useEffect } from 'react';
import NameValidator, { IParticipantValidator } from './NameValidator';

// Você precisa envolver isso em um hook personalizado ou componente
export const useNameValidator = () => {
    useEffect(() => {
        const api = APP.api;
        const nameValidator = NameValidator.getInstance();

        // Verifica nomes ao entrar
        api.on('participantJoined', (participant: IParticipantValidator) => {
            nameValidator.updateParticipant(participant.id, participant.displayName);
        });

        // Verifica mudanças de nome
        api.on('displayNameChange', (payload: { id: string; displayname: string }) => {
            const suggestedName = nameValidator.checkDuplicate(payload.displayname, payload.id);
            
            if (suggestedName) {
                api.executeCommand('displayName', suggestedName);
                // Mostra notificação
                api.executeCommand('notify', {
                    title: 'Nome duplicado',
                    description: `Seu nome foi alterado para ${suggestedName}`,
                    timeout: 3000
                });
            }
            
            nameValidator.updateParticipant(payload.id, suggestedName || payload.displayname);
        });

        // Remove ao sair
        api.on('participantLeft', (participant: IParticipantValidator) => {
            nameValidator.updateParticipant(participant.id, null);
        });

        return () => {
            api.dispose();
        };
    }, []);
};

// Então em seu componente React você usaria:
// const MyComponent = () => {
//     useNameValidator();
//     return (...);
// }