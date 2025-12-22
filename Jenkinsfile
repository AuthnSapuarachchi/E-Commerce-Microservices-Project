pipeline {
    agent any

    tools {
        maven 'maven-3' 
        jdk 'jdk-21'
    }

    environment {
        // Defines variables
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-login')
    }

    stages {
        stage('Checkout') {
            steps {
                // Pull code from GitHub
                git branch: 'main', url: 'https://github.com/AuthnSapuarachchi/shopwise-microservices.git'
            }
        }

        stage('Build & Test') {
            steps {
                // Compile and Run Tests
                sh 'mvn clean package -DskipTests' 
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Product Service Image
                    sh 'docker build -t authnbroo/product-service:latest ./product-service'
                }
            }
        }
    }
}