FROM node

WORKDIR /app

COPY . .
# add build steps
# check npm ci
RUN npm install

EXPOSE 3000

CMD ["node", "dist/main.js"]

# add 2e2 or unit test
# travis ci
# https://www.travis-ci.com/
# try run test in travis or run on heroku ci
# you can use GCP free acount for regestry (repository regestry)
# try run "cound run app" on GCP