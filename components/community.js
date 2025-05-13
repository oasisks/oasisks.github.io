import { defineAsyncComponent } from 'vue';

import profileImage from './profileimage.js';
import {
  fileToGraffitiObject,
  graffitiFileSchema,
} from "@graffiti-garden/wrapper-files";
import { GraffitiObjectToFile } from "@graffiti-garden/wrapper-files/vue";

export default defineAsyncComponent(async () => {
  const template = await fetch("./components/community.html").then((r) => r.text())
  return {
    name: 'Community',
    template: template,
    props: ["chatID", "groupName"],
    data() {
      return {
        myMessage: "",
        sending: false,
        creatingGroup: false,
        currentChannel: null,
        currentGroupName: null,
        channels: ["designftw"],
        editing: false,
        editingIndex: -1,
        graffitiFileSchema,
        newMessage: "",
        editingFailed: false,
        editGroupName: false,
        groupObj: null,
        newGroupName: "",
        createGroupName: "",
        profiles: [],
      };
    },
    async mounted() {
      this.loadingProfile = true;
      const schema = {
        properties: {
          value: {
                required: ['name', 'published', 'profileImage', 'description', 'generator', 'describes'],
                properties: {
                    name: { type: 'string' },
                    published: { type: 'number' },
                    profileImage: { type: 'string' },
                    description: { type: 'string' },
                    generator: { type: 'string' },
                    describes: { type: 'string' },
                }
          }
        }
      };

      const stream = this.$graffiti.discover(
        ['designftw', "designftw-2025-studio2"],
        schema, 
        this.$graffitiSession.value
      );
      for await (const obj of stream) {
        this.profiles.push(obj.object);
      }
    },
    methods: {
      async sendMessage(session) {
        if (!this.myMessage) return;
  
        this.sending = true;
  
        await this.$graffiti.put(
          {
            value: {
              content: this.myMessage,
              published: Date.now(),
            },
            channels: [this.chatID],
          },
          session,
        );
  
        this.sending = false;
        this.myMessage = "";
  
        // Refocus the input field after sending the message
        await this.$nextTick();
        this.$refs.messageInput.focus();
      },
      async createGroup(session) {
        if (!this.createGroupName) return;
        this.creatingGroup = true;
  
        await this.$graffiti.put(
          {
            value: {
              activity: 'Create',
              object: {
                type: 'Group Chat',
                name: this.createGroupName,
                channel: crypto.randomUUID(),
              }
            },
            channels: this.channels,
          },
          session,
        );
        this.createGroupName = "";
        this.creatingGroup = false;  
  
        await this.$nextTick();
        this.$refs.groupInput.focus();
      },
      selectGroup(name, channel, groupObj) {
        this.currentChannel = channel;
        this.currentGroupName = name;
        this.groupObj = groupObj;
      },
      exitGroup() {
        this.currentChannel = null;
        this.currentGroupName = null;
        this.groupObj = null;
      },
      async startEditing(session, messageObj, i) {
        let currentActor = session.actor;
        let messageActor = messageObj.actor;
  
        if (currentActor !== messageActor) {
          return;
        }
        this.editing = true;

        this.editingIndex = i;
        this.newMessage = messageObj.value.content;

        await this.$nextTick();
        console.log("I am start editing");
        console.log(this.editing);
        console.log(this.editingIndex);
        console.log(this.newMessage);

        // console.log(this.$refs);
        // this.$refs.newMessageInput[0].focus();
      },
      cancelEditing() {
        this.editing = false;
        this.editingIndex = -1;
        this.newMessage = "";
      },
      async editMessage(session, messageObj) {
        let currentActor = session.actor;
        let messageActor = messageObj.actor;
  
  
        if (currentActor !== messageActor) {
          this.editingFailed = true;
          return;
        }
  
        if (!this.newMessage) {
          return;
        }
        await this.$graffiti.patch(
          {
            value: [
              { "op": "replace", "path": "/content", "value": this.newMessage },
              // { "op": "replace", "path": "/published", "value": Date.now() },
            ]
          },
          messageObj,
          session
        )
        this.editing = false;
      },
      async deleteMessage(session, messageObj) {
        let currentActor = session.actor;
        let messageActor = messageObj.actor;
  
        if (currentActor !== messageActor) {
          return;
        }
        await this.$graffiti.delete(
          messageObj,
          session
        )
      },
      async startRenaming() {
        this.editGroupName = true;
        this.newGroupName = this.groupObj.value.object.name;
        await this.$nextTick();
        this.$refs.groupChatNameInput.focus();
      },
      getProfileImage(actor) {
        for (let i = 0; i < this.profiles.length; i++) {
          const profile = this.profiles[i];
          if (profile.actor === actor) {
            return profile.value.profileImage;
          }
        }
      },
      cancelRenaming() {
        this.editGroupName = false;
      },
      async renameGroup(session) {
        if (!this.groupObj) {
          return;
        }
        await this.$graffiti.patch(
          {
            value: [
              { "op": "replace", "path": "/object/name", "value": this.newGroupName },
            ]
          },
          this.groupObj,
          session
        )
        this.editGroupName = false;
        this.currentGroupName = this.newGroupName;
      },
    },
    components: { profileImage, GraffitiObjectToFile },
  };
});
  