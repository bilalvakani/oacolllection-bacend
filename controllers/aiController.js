const OpenAI = require('openai');

exports.generateModelImage = async (req, res) => {
  console.log('AI Generation requested. Key present:', !!process.env.OPENAI_API_KEY);
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
    return res.status(400).json({ message: 'OpenAI API Key is missing or invalid in .env' });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const { productName, category } = req.body;
  
  if (!productName) {
    return res.status(400).json({ message: 'Product name is required for AI generation' });
  }

  try {
    const prompt = `A high-end, professional fashion photography shot of a beautiful female model wearing a ${productName} (${category}). The model is posing in a premium lifestyle setting, looking elegant and sophisticated. High-quality fabric textures, soft lighting, 8k resolution, cinematic atmosphere.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;
    
    // Also generate a description using GPT
    const descResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `Write a premium, short e-commerce description for a ladies suit named ${productName}. Focus on luxury, embroidery, and style.` }],
    });

    const description = descResponse.choices[0].message.content;

    res.json({ imageUrl, description });
  } catch (err) {
    console.error('AI Generation Error:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI generation failed: ' + (err.message || 'Unknown error') });
  }
};
