export interface ParticipantType {
   id?: string
   name: string
   imageUrl: string
}

export interface RegisterType {
   name: string
   email: string
   password: string
}

export interface LoginType {
   email: string
   password: string
}

export interface VoteType {
   title: string
   participantIds: string[]
}