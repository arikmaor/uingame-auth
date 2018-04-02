git reset HEAD
git checkout -b deploy_to_heroku
git add certs -f
git commit -m "Add cert files for deployment"
git push heroku deploy_to_heroku:master --force
git checkout master
git checkout deploy_to_heroku -- certs
git reset HEAD
git branch -D deploy_to_heroku
