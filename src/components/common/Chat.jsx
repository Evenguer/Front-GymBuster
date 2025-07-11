import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

const ChatContainer = styled.div`
  .n8n-chat {
    --color-primary: #C50E1D;
    --color-primary-shade-50: #b30d1a;
    --color-primary-shade-100: #a00c17;
    --color-secondary: #090909;
    --color-white: #ffffff;
    --color-light: #f2f4f8;
    --color-dark: #090909;
  }

  .chat-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: var(--color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
    border: none;
    outline: none;
    z-index: 1000;
  }

  .chat-button:hover {
    background-color: var(--color-primary-shade-50);
  }

  .chat-window {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1000;
  }

  .chat-header {
    background-color: var(--color-primary);
    color: var(--color-white);
    padding: 16px;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .chat-input {
    padding: 16px;
    border-top: 1px solid var(--color-light);
  }

  .message-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--color-light);
    border-radius: 20px;
    outline: none;
  }
`;

const Chat = ({ user }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const response = await fetch('http://localhost:5678/webhook/8b3d8621-f638-46fd-870d-6b3f407ed524/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          metadata: {
            userId: user?.id || 'anonymous',
            userName: user?.name || 'Usuario',
            userRole: 'cliente'
          }
        })
      });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      // Verificar si hay contenido en la respuesta
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error('La respuesta no es JSON:', await response.text());
        throw new Error('La respuesta del servidor no es JSON válido');
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data); // Para depuración
      
      // Agregar respuesta del bot
      const botMessage = {
        type: 'bot',
        content: data.response || 'Lo siento, hubo un error al procesar tu mensaje.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error detallado al enviar mensaje:', {
        message: error.message,
        stack: error.stack,
      });
      // Agregar mensaje de error más descriptivo
      const errorMessage = {
        type: 'bot',
        content: `Error: ${error.message}. Por favor, inténtalo de nuevo más tarde.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <ChatContainer>
      <button 
        className="chat-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Asistente Virtual GymBuster</h3>
            <p>¿En qué puedo ayudarte?</p>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: msg.type === 'user' ? 'right' : 'left',
                  margin: '8px 0',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    maxWidth: '80%',
                    backgroundColor: msg.type === 'user' ? '#C50E1D' : '#f0f0f0',
                    color: msg.type === 'user' ? 'white' : 'black',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="message-input"
            />
          </form>
        </div>
      )}
    </ChatContainer>
  );
};

export default Chat;
