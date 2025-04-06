export interface IParticipantValidator {
    id: string;
    displayName: string | null;
}

export class NameValidator {
    private static instance: NameValidator;
    private participants: Map<string, string> = new Map(); // ID → DisplayName

    private constructor() {}

    public static getInstance(): NameValidator {
        if (!NameValidator.instance) {
            NameValidator.instance = new NameValidator();
            console.log('NomeValidator getInstance inicializado')
        }
        return NameValidator.instance;
    }

    public checkDuplicate(newName: string, currentUserId?: string): string | null {
        const names = Array.from(this.participants.values())
            .filter(name => name !== null) as string[];

        // Remove o usuário atual da verificação
        if (currentUserId && this.participants.has(currentUserId)) {
            const index = names.indexOf(this.participants.get(currentUserId)!);
            if (index > -1) {
                names.splice(index, 1);
            }
        }

        if (names.includes(newName)) {
            let counter = 1;
            let modifiedName = `${newName} (${counter})`;
            
            while (names.includes(modifiedName)) {
                counter++;
                modifiedName = `${newName} (${counter})`;
            }
            
            return modifiedName;
        }
        
        return null;
    }

    public updateParticipant(id: string, displayName: string | null): void {
        if (displayName) {
            this.participants.set(id, displayName);
        } else {
            this.participants.delete(id);
        }
    }
}