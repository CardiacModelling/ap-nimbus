node {
  stage('Checkout') {
    checkout scm
  }
  stage('Build') {
    dir('datastore') {
      // docker-compose command below creates a datastore:latest
      sh '''
         cp -v example.env .env
         docker-compose -f docker/docker-compose.yml build
      sh '''
    }
  }
}
