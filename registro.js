let signUp=document.getElementById("signUp");
let signIn=document.getElementById("signIn"); 
let nameInput=document.getElementById("nameInput");
let title=document.getElementById("title");



signIn.onclick=function(){
    nameInput.style.maxHeight="0";
    title.innerHTML="Login";
    signUp.classList.add("disable");
    signIn.classList.remove("disable");
}



signUp.onclick = function() {
    nameInput.style.maxHeight = "60px";
    title.innerHTML = "Registro";
    signUp.classList.remove("disable");
    signIn.classList.add("disable");

    // Capturar datos del formulario
    const perfil = document.querySelector('#perfilInput input').value;
    const nombre = document.querySelector('#nameInput input').value;
    const correo = document.querySelector('#emailInput input').value;
    const contrasena = document.querySelector('#passwordInput input').value;
    const confcontrasena = document.querySelector('#ConfpasswordInput input').value;
    console.log('Nombre:', nombre);
    console.log('Correo:', correo);
    console.log('Contraseña:', contrasena);
    console.log('Comfirmar Contraseña:', confcontrasena);
    console.log('Perfil:', perfil);

    // Guardar datos localmente en localStorage
    const registro = {
        perfil: perfil,
        nombre: nombre,
        correo: correo,
        contrasena: contrasena,
        confcontrasena: confcontrasena,
    
    };
    localStorage.setItem('registroUsuario', JSON.stringify(registro));
    console.log('Datos guardados en localStorage');

    // Mostrar mensaje en pantalla
    let mensaje = document.createElement('div');
    mensaje.textContent = 'Registro completo';
    mensaje.style.position = 'fixed';
    mensaje.style.top = '20px';
    mensaje.style.left = '50%';
    mensaje.style.transform = 'translateX(-50%)';
    mensaje.style.background = '#4caf50';
    mensaje.style.color = 'white';
    mensaje.style.padding = '10px 20px';
    mensaje.style.borderRadius = '5px';
    mensaje.style.zIndex = '1000';
    document.body.appendChild(mensaje);
    setTimeout(() => {
        mensaje.remove();
    }, 2000);

    // Limpiar los campos del formulario
    document.querySelector('#perfilInput input').value = '';
    document.querySelector('#nameInput input').value = '';
    document.querySelector('#emailInput input').value = '';
    document.querySelector('#passwordInput input').value = '';
    document.querySelector('#ConfpasswordInput input').value = '';
}