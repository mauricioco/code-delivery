#!/bin/bash

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

npm install --force

npm run start