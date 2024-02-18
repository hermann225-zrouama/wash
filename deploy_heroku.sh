sudo docker build . -t wash-backend-srv --platform linux/amd64 &&
docker tag wash-backend-srv registry.heroku.com/wash-backend-srv/web &&
docker push registry.heroku.com/wash-backend-srv/web &&
heroku container:release web -a wash-backend-srv
