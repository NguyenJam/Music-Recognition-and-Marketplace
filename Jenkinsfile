pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        AWS_REGION = 'ap-southeast-1'
        AWS_DEFAULT_REGION = 'ap-southeast-1'
        ECR_REPOSITORY = 'melodex'
    }

    stages {
        stage('Build and verify') {
            steps {
                sh 'chmod +x gradlew scripts/deploy-ssm.sh'
                sh './gradlew --no-daemon :server:check :server:bootJar :android-app:app:assembleDebug'
            }
        }

        stage('Publish Docker image') {
            when { branch 'main' }
            steps {
                script {
                    env.AWS_ACCOUNT_ID = sh(
                        script: 'aws sts get-caller-identity --query Account --output text',
                        returnStdout: true
                    ).trim()
                    env.IMAGE_URI = "${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${env.ECR_REPOSITORY}:${env.GIT_COMMIT.take(12)}"
                }
                sh '''
                    set -eu
                    registry="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                    aws ecr get-login-password --region "$AWS_REGION" \
                      | docker login --username AWS --password-stdin "$registry"
                    docker build --pull --tag "$IMAGE_URI" .
                    docker push "$IMAGE_URI"
                '''
            }
        }

        stage('Deploy to test') {
            when { branch 'main' }
            steps {
                sh 'scripts/deploy-ssm.sh test "$IMAGE_URI"'
            }
        }

        stage('Promote to production') {
            when { branch 'main' }
            input {
                message 'The test environment is healthy. Promote this same image to production?'
                ok 'Promote release'
            }
            steps {
                sh 'scripts/deploy-ssm.sh production "$IMAGE_URI"'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'server/build/libs/server-0.1.0.jar,android-app/app/build/outputs/apk/debug/*.apk',
                allowEmptyArchive: true,
                fingerprint: true
        }
    }
}
