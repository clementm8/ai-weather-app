import { useState } from "react";

const ModelTest = () => {
  const [results, setResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);

  const testModel = async (modelName) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
          max_tokens: 10
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => ({ ...prev, [modelName]: '✅ Available' }));
      } else {
        setResults(prev => ({ ...prev, [modelName]: `❌ ${data.error?.message || 'Error'}` }));
      }
    } catch (error) {
      setResults(prev => ({ ...prev, [modelName]: `❌ ${error.message}` }));
    }
  };

  const testAllModels = async () => {
    setIsTesting(true);
    setResults({});
    
    const models = [
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k', 
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-4'
    ];

    for (const model of models) {
      await testModel(model);
      // Wait 1 second between tests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsTesting(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Test Available OpenAI Models</h2>
      <button 
        onClick={testAllModels} 
        disabled={isTesting}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          marginBottom: '20px',
          backgroundColor: isTesting ? '#ccc' : '#0077ff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isTesting ? 'not-allowed' : 'pointer'
        }}
      >
        {isTesting ? 'Testing...' : 'Test All Models'}
      </button>
      
      <div style={{ textAlign: 'left' }}>
        {Object.entries(results).map(([model, status]) => (
          <div key={model} style={{ 
            padding: '10px', 
            margin: '5px 0', 
            border: '1px solid #ddd', 
            borderRadius: '5px',
            backgroundColor: status.includes('✅') ? '#e8f5e8' : '#ffe8e8'
          }}>
            <strong>{model}:</strong> {status}
          </div>
        ))}
      </div>
      
      {Object.keys(results).length > 0 && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
          <h3>Recommendations:</h3>
          <ul>
            {results['gpt-3.5-turbo']?.includes('✅') && (
              <li><strong>gpt-3.5-turbo</strong> - Best free option, good performance</li>
            )}
            {results['gpt-4o-mini']?.includes('✅') && (
              <li><strong>gpt-4o-mini</strong> - Better performance, higher rate limits</li>
            )}
            {results['gpt-3.5-turbo-16k']?.includes('✅') && (
              <li><strong>gpt-3.5-turbo-16k</strong> - Good for longer conversations</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ModelTest; 