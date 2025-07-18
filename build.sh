cd website
docker build -t julianbierbaum/repo:pdf-analyser .

wait 1

docker push julianbierbaum/repo:pdf-analyser

cd ..