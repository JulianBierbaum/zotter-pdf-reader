cd model
docker build -t julianbierbaum/repo:ollama-gemma .

wait 1

docker push julianbierbaum/repo:ollama-gemma

wait 1

cd ..

cd website
docker build -t julianbierbaum/repo:next-app .

wait 1

docker push julianbierbaum/repo:next-app

cd ..