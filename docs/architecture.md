# FinAdvisor Architecture

```mermaid
flowchart LR
    User -->|HTTP/HTTPS| React[React Frontend]
    React -->|REST API| Express[Express Backend]
    
    subgraph Backend Services
        Express --> Auth[JWT Authentication]
        Express --> NLP[Dialogflow Service]
        Express --> AI[Gemini Service]
        Express --> Market[Market Data Services]
    end
    
    subgraph External APIs
        NLP -.->|Intent Classification| Dialogflow[Google Dialogflow]
        AI -.->|Generative Response| Gemini[Google Gemini API]
        Market -.->|Stock Data| Finnhub[Finnhub API]
        Market -.->|Crypto Data| Binance[Binance API]
        Market -.->|Forex Data| Frankfurter[Frankfurter API]
    end
    
    subgraph Database
        Express --> MySQL[(MySQL DB)]
    end
```

## System Components

1. **Frontend**: React application built with Vite and Tailwind CSS.
2. **Backend**: Node.js/Express RESTful API.
3. **Database**: MySQL used for storing users, chat history, and watchlists.
4. **AI Layer**: Gemini (Natural Language Generation) + Dialogflow (Intent Classification).
5. **Data Layer**: Finnhub (Stocks), Binance (Crypto), Frankfurter (Forex).
