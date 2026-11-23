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

    stages {
        stage('Build and verify') {
            steps {
                sh 'chmod +x gradlew'
                sh './gradlew --no-daemon :server:check :server:bootJar'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'server/build/libs/server-0.1.0.jar',
                allowEmptyArchive: true,
                fingerprint: true
        }
    }
}
