import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name: "realTimeNotification",
    initialState: {
        likeNotification: [],
    },
    reducers: {
        setLikeNotification: (state, action) => {
            
                if (
                  action.payload.type === "like" ||
                  action.payload.type === "follow" ||
                  action.payload.type === "comment"
                ) {
                  state.likeNotification.push(action.payload);
                } else if (
                  action.payload.type === "dislike" ||
                  action.payload.type === "unfollow"
                ) {
                  state.likeNotification = state.likeNotification.filter(
                    (item) => item.userId !== action.payload.userId,
                  );
                }
            
        },
        setNotification: (state, action) => {
            state.likeNotification = action.payload;
        }
    }
});

export const { setLikeNotification,setNotification } = rtnSlice.actions;
export default rtnSlice.reducer;