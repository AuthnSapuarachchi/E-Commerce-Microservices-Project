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
                git branch: 'main', 
                    credentialsId: 'github-login', 
                    url: 'https://github.com/AuthnSapuarachchi/E-Commerce-Microservices-Project.git'
            }
        }

        stage('Build & Test') {
            steps {
                // Compile and Run Tests
                sh 'mvn -f product-service/pom.xml clean package -DskipTests' 
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