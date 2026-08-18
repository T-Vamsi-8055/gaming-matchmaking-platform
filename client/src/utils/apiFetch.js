const API_PORT=3000;
export async function apiFetch(prompt,data){
    try{
        const result=await fetch(prompt, data);
        if(result.status!=401){
            return result;
        }
        else{
            const refresh=await fetch(`https://localhost:${API_PORT}/api/auth/refreshToken`,{
                method: "POST",
                credentials: "include"
            })
            const body = await refresh.json();
            if(refresh.ok){
                localStorage.setItem("jwt-auth-token",body.token);
                const result=await fetch(prompt, data);
                return result;
            }else{
                window.location.href = "/auth";   
                return;
            }
        }
    }catch(Err){
        console.log(Err);
    }
}