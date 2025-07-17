cd model
docker build -t julianbierbaum/repo:ollama-gemma .
docker push julianbierbaum/repo:ollama-gemma

cd ..

cd website
docker build -t julianbierbaum/repo:next-app .
docker push julianbierbaum/repo:next-app

cd ..