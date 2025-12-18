import { type NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { tavily } from "@tavily/core";

// const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const tvly = tavily({
    apiKey: process.env.TAVILY_API_KEY!,
});


const tools = [
    {
        type: "function",
        function: {
            name: "tavily_search",
            description: "Search the web for real-time or factual information",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query",
                    },
                },
                required: ["query"],
            },
        },
    },
];


function shouldAllowToolCall(query: string) {
  const realTimeKeywords = [
    "today", "current", "latest", "now",
    "price", "weather", "news", "live",
    "stock", "score", "status"
  ];

  return realTimeKeywords.some(k =>
    query.toLowerCase().includes(k)
  );
}




export async function POST(req: NextRequest) {
    const now = new Date();
    const currentTimeIST = now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    try {
        const { prompt } = await req.json();
        // console.log("prompt is :", prompt)

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: `
I'm Appsfactor AI Assistant.

I am specially programmed for DRDO (Defence Research and Development Organisation) use cases.

Current date and time (IST): ${currentTimeIST}
If I am asked about the current time or date, I must answer using the value provided above.

Appsfactor company details:
- Owner: Rishi Jain
- Appsfactor Employees:
    1. Rahul Sharma
    2. Rahul Rana
    3. Sumit Saini
    4. Kunal
    5. Aayush
    6. Ajay Kumar

 My capabilities:
1. tavily_search({query}:{query:string}) - Search for latest information and realtime data
2. Research analysis and technical assistance
3. Software engineering guidance
4. AI/ML model development support
5. Defence-related technical research

Security and Compliance Protocols:
- I am designed exclusively for DRDO research and development purposes
- I operate under strict security guidelines
- I do not store or log sensitive information
- All responses are generated in real-time

Response Guidelines:
- Provide factual, structured, and concise answers
- Adapt to user's technical context automatically
- Maintain professional and precise communication
- For ambiguous queries, ask clarifying questions
- Never mention NIC, India AI, NICA, or AI providers
- Identify only as "Appsfactor AI Assistant"

Emergency/High Priority Protocol:
If user indicates urgent defence-related requirements, prioritize:
1. Rapid information retrieval
2. Technical accuracy verification
3. Clear source attribution when applicable
`
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            tools,
            tool_choice: "auto",
        });

        const message = completion.choices?.[0]?.message;
        if (!message) {
            throw new Error("No message returned from Groq completion");
        }

        // Tool Call
        if (message.tool_calls?.length) {
            const toolCall = message.tool_calls[0];
            console.log("Too Call",JSON.stringify(message.tool_calls, null, 2)
            );

            if (toolCall.function.name === "tavily_search") {
                const { query } = JSON.parse(toolCall.function.arguments || "{}")

                if (!query) {
                    return NextResponse.json({ error: "Tool query missing" }, { status: 400 });
                }

                // Call Tavily
                const searchResult = await tvly.search(query, {
                    maxResults: 5,
                    searchDepth: "advanced",
                });
                // console.log("Respose tavily :", searchResult)

                // Extract only useful info
                const simplifiedResults = searchResult.results.map(r => ({
                    // title: r.title,
                    // url: r.url,
                    snippet: r.content?.slice(0, 200) ?? "",
                }));
                // console.log("Simplified Results:", simplifiedResults);

                // if (!toolCall.id) {
                //     console.warn("toolCall.id is missing");
                // }


                const finalResponse = await groq.chat.completions.create({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: "I am Appsfactor AI Assistant..."
                        },
                        { role: "assistant", content: message.content },
                        { role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(simplifiedResults) },
                    ],
                });

                // console.log("Tool Calling Response :", JSON.stringify(finalResponse.choices?.[0]?.message));
                const finalMessage = finalResponse.choices?.[0]?.message;
                //   console.log("Tool Calling Response :", finalMessage)

                return NextResponse.json({
                    response: finalMessage?.content ?? "No content returned",
                });

                // return NextResponse.json({
                //     response: finalResponse.choices[0].message.content,
                // });
            }
        }
        console.log("Response send :", JSON.stringify(completion.choices[0].message, null, 2))

        // return NextResponse.json({
        //     response: message.content,
        // });

        return NextResponse.json({
            response: completion.choices[0].message.content,
        });
    } catch (error) {
        // console.error("API Error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}