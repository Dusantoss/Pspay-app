import React from 'react';

// Importamos as duas versões da sua imagem
// Ajuste o caminho se a sua pasta 'img' estiver em outro lugar
import logoParaFundoEscuro from '../pages/img/logo Pspay App-fundo claro.png';
import logoParaFundoClaro from '../pages/img/logo Pspay App-fundo escuro.png';

const Logo = ({ variant = 'claro', className = '' }) => {
  // Escolhe qual imagem usar baseado na variante (se o fundo da página é claro ou escuro)
    const logoSrc = variant === 'claro' ? logoParaFundoClaro : logoParaFundoEscuro;

      // O componente agora retorna apenas a sua imagem, com o tamanho exato definido
        return (
            <img
                  src={logoSrc}
                        alt="Logo Pspay"
                              // Usamos classes do Tailwind para definir o tamanho exato que você pediu.
                                    // object-contain garante que a imagem não seja distorcida.
                                          className={`w-[180px] h-[54px] object-contain ${className}`}
                                              />
                                                );
                                                };

                                                export default Logo;
                                                
