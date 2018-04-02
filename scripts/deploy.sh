git reset HEAD
git checkout -b deploy_to_heroku
git add certs -f
git commit -m "Add cert files for deployment"
git push heroku master
git reset HEAD^
git checkout master
git branch -D deploy_to_heroku
