import { createContext, useState } from 'react';

export const GroupChatIdContext = createContext(null)
export default function GroupChatIdProvider({ children }) {
    const [groupChatId, setGroupChatId] = useState(0);
    return (
        <GroupChatIdContext.Provider value={{ groupChatId, setGroupChatId }}>
            {children}
        </GroupChatIdContext.Provider>
    );
}