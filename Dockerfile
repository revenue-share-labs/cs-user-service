FROM node:18-slim

# Bundle app source
COPY . .

#temporary solution, delete follow lines for CI
RUN npm install && \
    npm run prisma -- generate && \
    npm run build

# Expose port and start application
EXPOSE 3030

# CMD ["prisma/setup.sh", "&&", "npm", "run", "start:prod"]
CMD ["/bin/bash", "-c", "./run.sh"]
