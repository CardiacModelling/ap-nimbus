#!/usr/bin/env groovy

def setEnvVar() {
  script {
    env.RUN_DEPLOY = 'true'
    //  https://akomljen.com/set-up-a-jenkins-ci-cd-pipeline-with-kubernetes/
    myRepo = checkout scm
    gitCommit = myRepo.GIT_COMMIT
    env.SHORT_GIT_COMMIT = "${gitCommit[0..8]}"
  }
}

def testResponse(requestHttpMode, requestUrl) {
  // Requires "HTTP Request Plugin" to be installed in Jenkins
  response = httpRequest url: requestUrl, httpMode: requestHttpMode, validResponseCodes: '200'
  //status = response.getStatus()
  //content = response.getContent() 
  //echo "${requestHttpMode} to ${requestUrl} returned status ${status} and content ${content}"
}

pipeline {
  agent any
  environment {
    // https://stackoverflow.com/questions/36507410/is-it-possible-to-capture-the-stdout-from-the-sh-dsl-command-in-the-pipeline/38912813#38912813
    // https://stackoverflow.com/questions/6481005/how-to-obtain-the-number-of-cpus-cores-in-linux-from-the-command-line

    // Oversimplistic way to guess how many processors to use.
    PROC_COUNT = sh(returnStdout: true, script: 'echo $(( `grep -c ^processor /proc/cpuinfo` / 2 ))').trim()
  }
  stages {
    stage('Build app-manager') {
      when {
        changeset "app-manager/**"
      }
      steps {
        load 'app-manager/Jenkinsfile'
        setEnvVar()
      }
    }
    stage('Build client-direct') {
      when {
        changeset "client-direct/**"
      }
      steps {
        load 'client-direct/Jenkinsfile'
        setEnvVar()
      }
    }
    stage('Build datastore') {
      when {
        changeset "datastore/**"
      }
      steps {
        load 'datastore/Jenkinsfile'
        setEnvVar()
      }
    }
    stage('Detect config change') {
      // https://jenkins.io/doc/book/pipeline/syntax/#when
      when {
        anyOf {
          changeset "deploy/o11n/k8s/microk8s/**"
          changeset "Jenkinsfile"
        }
      }
      steps {
        setEnvVar()
      }
    }
    stage('Load repo and deploy') {
      when {
        expression {
          env.RUN_DEPLOY == 'true'
        }
      }
      stages {
        stage('Load env vars') {
          steps {
            script {
              load "${JENKINS_HOME}/.envvars/dev.groovy"
            }
          }
        }
        stage('Tag and push') {
          // https://jenkins.io/doc/book/pipeline/syntax/#parallel
          failFast true
          parallel {
            stage('Tagging app-manager') {
              steps {
                sh "docker tag app-manager:jenkinslatest ${env.LOCAL_REGISTRY}/ap-nimbus-app-manager:jenkinslatest && \
                    docker push ${env.LOCAL_REGISTRY}/ap-nimbus-app-manager:jenkinslatest"
              }
            }
            stage('Tagging client-direct') {
              steps {
                sh "docker tag client-direct:jenkinslatest ${env.LOCAL_REGISTRY}/ap-nimbus-client-direct:jenkinslatest && \
                    docker push ${env.LOCAL_REGISTRY}/ap-nimbus-client-direct:jenkinslatest"
              }
            }
            stage('Tagging datastore') {
              steps {
                // TODO : datastore's docker-compose builds datastore:latest, not datastore:jenkinslatest!
                sh "docker tag datastore:latest ${env.LOCAL_REGISTRY}/ap-nimbus-datastore:jenkinslatest && \
                    docker push ${env.LOCAL_REGISTRY}/ap-nimbus-datastore:jenkinslatest"
              }
            }
          }
        }
        stage('Deploy on microk8s') {
          environment {
            // https://serverfault.com/questions/791715/using-environment-variables-in-kubernetes-deployment-spec
            DEPLOY_URL = "${env.DEPLOY_URL}"
            LOCAL_REGISTRY = "${env.LOCAL_REGISTRY}"
          }
          steps {
            dir('deploy/o11n/k8s/microk8s') {
              // TODO : On first run this will fail on trying to delete (so initially comment out the deletion!)
              sh "./run.sh delete"
              sh "cd admin && ./run.sh delete"
              sh "cd admin && ./run.sh create"
              sh "./run.sh create"
            }
          }
        }
        stage('Pause on microk8s') {
          steps {
            // Wait 30 seconds - although on first deploy this will need increasing!
            script {
              echo "Waiting 30 seconds for containers to start!!!"
              // https://jenkins.io/doc/pipeline/steps/workflow-basic-steps/#sleep-sleep
              sleep(time: 30, unit: "SECONDS")
            }
          }
        }
        stage('Test on microk8s') {
          failFast true
          parallel {
            stage('Testing app-manager') {
              steps {
                testResponse('GET', "${env.RESPONSE_TEST_URL}/am/")
              }
            }
            stage('Testing client-direct') {
              steps {
                testResponse('GET', "${env.RESPONSE_TEST_URL}/")
              }
            }
            stage('Testing datastore') {
              steps {
                testResponse('GET', "${env.RESPONSE_TEST_URL}/api/collection/youwontfindthis/")
              }
            }
          }
        }
      }
    }
  }
}
