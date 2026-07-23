import { nanoid } from 'nanoid'

export function generateShortId(){
    const shortid = nanoid(5).toLowerCase();
    return shortid;
}

