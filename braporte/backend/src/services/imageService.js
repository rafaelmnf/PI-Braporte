/**
 * Serviço responsável pelo processamento de imagens.
 * Segue o princípio de Responsabilidade Única (SOLID).
 */
class ImageService {
    /**
     * Converte uma string base64 para um Buffer do Node.js.
     * @param {string} base64String 
     * @returns {{ buffer: Buffer, type: string } | null}
     */
    decodeBase64(base64String) {
        if (!base64String) return null;

        // Verifica se a string contém o prefixo de data URI (ex: data:image/png;base64,...)
        const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
            return {
                type: matches[1],
                buffer: Buffer.from(matches[2], 'base64')
            };
        }

        // Caso seja apenas a string base64 pura
        return {
            type: 'image/jpeg', // Default ou extraído de outro lugar
            buffer: Buffer.from(base64String, 'base64')
        };
    }

    /**
     * Converte um Buffer de volta para uma string base64 formatada como data URI.
     * @param {Buffer} buffer 
     * @param {string} type 
     * @returns {string | null}
     */
    encodeBase64(buffer, type) {
        if (!buffer) return null;

        let buf = buffer;

        // o driver do Postgres pode devolver o bytea de formas diferentes:
        // como Buffer (ideal), como string hex (\x89504e...) ou como objeto.
        if (!Buffer.isBuffer(buf)) {
            if (typeof buf === 'string') {
                // string hex no formato \x...
                if (buf.startsWith('\\x')) {
                    buf = Buffer.from(buf.slice(2), 'hex');
                } else {
                    // ja pode ser uma string base64 / data URI
                    return buf.startsWith('data:')
                        ? buf
                        : (type ? `data:${type};base64,${buf}` : buf);
                }
            } else {
                // objeto tipo { type: 'Buffer', data: [...] }
                buf = Buffer.from(buf.data || buf);
            }
        }

        const base64 = buf.toString('base64');
        return type ? `data:${type};base64,${base64}` : base64;
    }
}

module.exports = new ImageService();
