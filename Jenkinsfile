pipeline {
    agent any
    environment {
       registryCredential = 'docker-hub-read-write-token'
    }
        stages {
            stage('Substitute Dockerfile for dev build'){
	         when {
                branch 'dev'
             }
          steps {
            script {
		      sh "mv Dockerfile_dev Dockerfile"
            }
          }
        }
        stage('Building image') {
          steps{
            script {
              echo "Building branch: ${env.BRANCH_NAME}"
              echo "Building tag: ${env.TAG_NAME}"
              echo "Building commit: ${env.GIT_COMMIT}"
	         dockerImage = docker.build "bitmediacorp/rollercoin-react-mainapp-frontend:${env.GIT_COMMIT}"
            }
          }
        }
        stage('Push Image') {
          steps{
            script {
              docker.withRegistry('', registryCredential) {
                 dockerImage.push(env.GIT_COMMIT)
                 if (env.TAG_NAME) {
                    dockerImage.push(env.TAG_NAME)
                 }
                 if (env.BRANCH_NAME) {
                   dockerImage.push(env.BRANCH_NAME)
                 }
              }
            }
          }
        }
        stage('Push docker image tag for prod') {
            when {
                branch 'master'
            }
            steps {
                script {
                  docker.withRegistry('', registryCredential) {
                     dockerImage.push("prod")
                  }
                }
            }
        }
        stage('Push docker image tag for dev') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    docker.withRegistry('', registryCredential) {
                         dockerImage.push("dev")
                    }
                }
            }
        }
        stage('Cleanup jenkins build agent') {
          steps{
            sh "docker rmi ${dockerImage.id}"
          }
        }
  }
}
    
