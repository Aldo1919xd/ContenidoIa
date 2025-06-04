
  document.addEventListener('DOMContentLoaded', function() {
            const generateBtn = document.getElementById('generate-btn');
            const loadingElement = document.getElementById('loading');
            const resultsContainer = document.getElementById('results');
            const ideasContainer = document.getElementById('ideas-container');
            const errorMessage = document.getElementById('error-message');
            
            generateBtn.addEventListener('click', async function() {
                const apiKey = document.getElementById('api-key').value.trim();
                const topic = document.getElementById('topic').value.trim();
                const quantity = document.getElementById('quantity').value;
                
                // Validaciones
                if (!apiKey) {
                    showError('Por favor ingresa tu API Key de OpenAI');
                    return;
                }
                
                if (!topic) {
                    showError('Por favor ingresa un tema para generar contenido');
                    return;
                }
                
                // Mostrar loading y ocultar resultados
                loadingElement.style.display = 'block';
                resultsContainer.style.display = 'none';
                generateBtn.disabled = true;
                hideError();
                
                try {
                    // Limpiar resultados anteriores
                    ideasContainer.innerHTML = '';
                    
                    // Generar las ideas
                    const ideas = await generateContentIdeas(apiKey, topic, quantity);
                    
                    // Mostrar los resultados
                    displayIdeas(ideas);
                    resultsContainer.style.display = 'block';
                } catch (error) {
                    showError('Error al generar contenido: ' + error.message);
                    console.error(error);
                } finally {
                    loadingElement.style.display = 'none';
                    generateBtn.disabled = false;
                }
            });
            
            function showError(message) {
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
            }
            
            function hideError() {
                errorMessage.style.display = 'none';
            }
            
            async function generateContentIdeas(apiKey, topic, quantity) {
                const ideas = [];
                
                for (let i = 0; i < quantity; i++) {
                    const idea = await generateSingleIdea(apiKey, topic);
                    ideas.push(idea);
                }
                
                return ideas;
            }
            
            async function generateSingleIdea(apiKey, topic) {
                // Primero generamos el copy
                const copyPrompt = `Eres un experto en creación de contenido educativo sobre inteligencia artificial para estudiantes universitarios. 
                
                Genera un texto de publicación (copy) para una fanpage sobre IA que cumpla con estos requisitos:
                - Tema principal: ${topic}
                - Longitud: 150-300 palabras
                - Estilo: Educativo pero accesible, atractivo para jóvenes universitarios
                - Formato: Párrafos cortos, lenguaje claro
                - Elementos a incluir:
                  * Título llamativo
                  * Contenido educativo y valioso
                  * Un dato interesante o estadística relevante
                  * Una pregunta para generar engagement
                  * 3-5 hashtags relevantes (ej. #IAparaEstudiantes)
                  * Uso moderado de emojis (máximo 3-4)
                
                El texto debe ser original, bien investigado y con un tono profesional pero cercano.`;
                
                const copy = await callOpenAI(apiKey, copyPrompt);
                
                // Luego generamos la descripción de la imagen
                const imagePrompt = `Basado en este texto para una publicación en redes sociales sobre ${topic}, crea una descripción detallada para una imagen que lo acompañe:
                
                Texto de la publicación:
                ${copy}
                
                La descripción debe:
                - Ser específica y detallada (al menos 50 palabras)
                - Complementar visualmente el mensaje del texto
                - Incluir elementos que resuenen con estudiantes universitarios
                - Sugerir profesionalismo y educación
                - Considerar composición, colores y estilo visual apropiado`;
                
                const imageDescription = await callOpenAI(apiKey, imagePrompt);
                
                return {
                    copy,
                    imageDescription
                };
            }
            
            async function callOpenAI(apiKey, prompt) {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: 'Eres un asistente experto en creación de contenido educativo sobre inteligencia artificial para redes sociales.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'Error en la API de OpenAI');
                }
                
                const data = await response.json();
                return data.choices[0].message.content.trim();
            }
            
            function displayIdeas(ideas) {
                ideasContainer.innerHTML = '';
                
                ideas.forEach((idea, index) => {
                    const ideaElement = document.createElement('div');
                    ideaElement.className = 'idea';
                    
                    ideaElement.innerHTML = `
                        <h3>Idea ${index + 1}</h3>
                        <div class="copy-text">${idea.copy.replace(/\n/g, '<br>')}</div>
                        <h4>Descripción para imagen:</h4>
                        <div class="image-description">${idea.imageDescription.replace(/\n/g, '<br>')}</div>
                    `;
                    
                    ideasContainer.appendChild(ideaElement);
                });
            }
        });
