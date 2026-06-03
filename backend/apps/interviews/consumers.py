from channels.generic.websocket import AsyncJsonWebsocketConsumer

class InterviewHubConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # Secure the socket: only allow authenticated users to connect
        user = self.scope.get("user")
        if not user or user.is_anonymous:
            await self.close()
            return
            
        await self.channel_layer.group_add("interviewhub", self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        try:
            await self.channel_layer.group_discard("interviewhub", self.channel_name)
        except Exception:
            pass

    async def _is_allowed(self, event):
        user = self.scope.get("user")
        if not user or user.is_anonymous:
            return False
            
        # Allow all authenticated roles (Admin, Viewer, and Candidate) to receive updates
        return True

    # Handlers for group-sent events (dispatched via ws_broadcast in views)
    async def interview_status_changed(self, event):
        if await self._is_allowed(event):
            await self.send_json(event)

    async def interview_created(self, event):
        if await self._is_allowed(event):
            await self.send_json(event)

    async def interview_deleted(self, event):
        if await self._is_allowed(event):
            await self.send_json(event)

    async def notice_new(self, event):
        # Public announcements
        await self.send_json(event)

    async def notice_deleted(self, event):
        # Public announcements
        await self.send_json(event)

    async def comment_new(self, event):
        if await self._is_allowed(event):
            await self.send_json(event)
