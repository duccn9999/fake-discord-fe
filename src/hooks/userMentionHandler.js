import { useState, useEffect, useRef } from "react";

export function useMentionHandler(roles, usersInGroupChat) {
  const [message, setMessage] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [suggestionFilter, setSuggestionFilter] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionUsers, setMentionUsers] = useState([]);
  const inputRef = useRef(null);
  const handleInputChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setMessage(value);
    setCursorPosition(cursorPos);

    // Check if we're in a mention context (@)
    let mentionStartPos = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (value[i] === "@") {
        mentionStartPos = i;
        break;
      } else if (value[i] === " " || value[i] === "\n") {
        break;
      }
    }
    setMentionStart(mentionStartPos);

    if (mentionStartPos >= 0) {
      const filter = value
        .substring(mentionStartPos + 1, cursorPos)
        .toLowerCase();
      setSuggestionFilter(filter);
      setShowSuggestions(true);

      // Find matching roles
      const matchingRoles = roles.filter((role) =>
        role.roleName.toLowerCase().includes(filter)
      );

      // Find matching users
      const matchingUsers = usersInGroupChat.filter((user) =>
        user.userName.toLowerCase().includes(filter)
      );

      setSuggestions(
        Array.from(
          new Map(
            [...matchingRoles, ...matchingUsers].map((item) => [
              item.roleName || item.userName,
              item,
            ])
          ).values()
        )
      );
    } else {
      setShowSuggestions(false);
    }

    processMentions(value);
  };
  // Insert a mention (user or role)
  const insertMention = (suggestion) => {
    const beforeMention = message.substring(0, mentionStart);
    const afterMention = message.substring(cursorPosition);
    
    let mentionText;
    if (suggestion.color) {
      mentionText = `@${suggestion.roleName}`;
    } else {
      mentionText = `@${suggestion.userName}`;
    }
    
    const newValue = `${beforeMention}${mentionText} ${afterMention}`;
    
    setMessage(newValue);
    setShowSuggestions(false);
    // Process mentions in the new text
    processMentions(newValue);
    
    // Focus back on input and place cursor after the inserted mention
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Set cursor position after the inserted mention
        const newCursorPosition = mentionStart + mentionText.length + 1; // +1 for space
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        setCursorPosition(newCursorPosition);
      }
    }, 0);
  };
  const processMentions = (text) => {
    const words = text.split(/\s+/);
    const userIds = new Set();
    const roleIds = new Set();

    words.forEach((word) => {
      if (word.startsWith("@")) {
        const term = word.substring(1);
        if (roles.some((role) => role.roleName === term)) {
          roleIds.add(term);
          // Add all users with this role
          usersInGroupChat.forEach((user) => {
            if (user.roles.some((role) => role.roleName === term)) {
              userIds.add(user.userId);
            }
          });
        } else {
          const user = usersInGroupChat.find((u) => u.userName === term);
          if (user) {
            userIds.add(user.userId);
          }
        }
      }
    });

    setMentionUsers(Array.from(userIds));
  };
  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return {
    message,
    setMessage,
    cursorPosition,
    setCursorPosition,
    mentionStart,
    setMentionStart,
    suggestionFilter,
    showSuggestions,
    suggestions,
    mentionUsers,
    handleInputChange,
    insertMention,
    inputRef,
  };
}
